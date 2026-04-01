import { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type ResearchPaperPdfViewerProps = {
  url: string
  title: string
}

/**
 * Renders PDF pages with PDF.js (react-pdf). Native iframe PDF embeds do not scroll
 * reliably on mobile Safari/Chrome; canvas-based pages scroll with the page.
 */
export default function ResearchPaperPdfViewer({ url, title }: ResearchPaperPdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageWidth, setPageWidth] = useState(() =>
    typeof window !== 'undefined' ? Math.max(200, Math.floor(window.innerWidth - 48)) : 320,
  )

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w > 0) setPageWidth(Math.floor(w - 4))
  }, [])

  useEffect(() => {
    measure()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div
      ref={containerRef}
      className="scrollbar-glass flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
      role="region"
      aria-label={title}
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        loading={
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-text-muted">
            <span className="text-sm">Loading PDF…</span>
          </div>
        }
        error={
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-text-muted">
            <span>Couldn’t display this PDF inline.</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target rounded-[10px] border border-border bg-surface px-4 py-2 font-display text-[0.85rem] font-bold uppercase tracking-wide text-text-pri"
            >
              Open PDF in new tab
            </a>
          </div>
        }
        className="flex flex-col items-stretch gap-3 p-2 pb-4"
      >
        {numPages > 0 && pageWidth > 0
          ? Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={pageWidth}
                className="mx-auto max-w-full rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
                renderAnnotationLayer
                renderTextLayer
              />
            ))
          : null}
      </Document>
    </div>
  )
}
