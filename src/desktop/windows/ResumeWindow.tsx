const RESUME_PDF = '/resume.pdf'

/**
 * Inline PDF viewer styled like macOS Preview.
 * Rendered as content inside MacWindow — do NOT wrap in another MacWindow.
 */
export function ResumeWindow() {
  return (
    <div className="resume-shell">
      {/* Toolbar strip */}
      <div className="resume-toolbar">
        <span className="resume-toolbar-filename">resume.pdf</span>
        <span className="resume-toolbar-badge">PDF</span>
        <div style={{ flex: 1 }} />
        <a
          href={RESUME_PDF}
          download="Jose_Correa_Resume.pdf"
          className="resume-download-btn"
          aria-label="Download resume PDF"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 12l-4.5-4.5 1.06-1.06L7.25 9.13V2h1.5v7.13l2.69-2.69 1.06 1.06L8 12z"/>
            <path d="M2 14h12v1.5H2V14z"/>
          </svg>
          Download
        </a>
      </div>

      {/* PDF viewport */}
      <div className="resume-viewport">
        <div className="resume-page-wrap" style={{ width: '100%', maxWidth: 760 }}>
          <iframe
            src={`${RESUME_PDF}#toolbar=0&navpanes=0&scrollbar=1`}
            title="Jose Correa Resume"
            className="resume-iframe"
            aria-label="Resume PDF viewer"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32, textAlign: 'center' }}>
              <p style={{ color: 'rgba(249,245,255,0.6)', fontSize: 13 }}>
                Your browser can't display PDFs inline.
              </p>
              <a href={RESUME_PDF} download className="btn-primary">
                Download Resume
              </a>
            </div>
          </iframe>
        </div>
      </div>

      {/* Status bar */}
      <div className="resume-statusbar">
        <span>resume.pdf</span>
      </div>
    </div>
  )
}
