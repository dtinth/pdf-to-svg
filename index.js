#!/usr/bin/env node

// Based on:
// https://github.com/mozilla/pdf.js/blob/93ed4bfa119fe82c1fe1fe9cd7d08b1ae719b49e/examples/node/pdf2svg.js
// https://github.com/James-Yu/LaTeX-Workshop/blob/dff35ef4d3a090b49804704cd164f0fd71e18cec/src/providers/preview/pdfrenderer_worker.ts

const pdfjs = require('pdfjs-dist/legacy/build/pdf')
const fs = require('fs')
const tkt = require('tkt')
const path = require('path')

async function main(args) {
  require('@tamuratak/domstubs').setStubs(global)
  const pdf = fs.readFileSync(args.pdf)
  const document = await pdfjs.getDocument({
    data: pdf,
    fontExtraProperties: true,
    cMapUrl: path.dirname(require.resolve('pdfjs-dist/cmaps/LICENSE')),
    cMapPacked: true,
  }).promise
  const page = await document.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  const operatorList = await page.getOperatorList()
  const svgGraphics = new pdfjs.SVGGraphics(page.commonObjs, page.objs)
  svgGraphics.embedFonts = true
  const svg = (await svgGraphics.getSVG(operatorList, viewport)).toString()
  fs.writeFileSync(
    args.svg ||
      path.join(
        path.dirname(args.pdf),
        path.basename(args.pdf, '.pdf') + '.svg',
      ),
    svg,
  )
}

tkt
  .cli()
  .command(
    '$0 <pdf> [svg]',
    'Convert PDF to SVG with embedded fonts.',
    {
      pdf: {
        type: 'string',
      },
      svg: {
        type: 'string',
      },
    },
    main,
  )
  .parse()
