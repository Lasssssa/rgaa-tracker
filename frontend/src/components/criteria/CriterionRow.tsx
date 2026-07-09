import ReactMarkdown from 'react-markdown'
import type { Criterion } from '../../types'

interface CriterionRowProps {
  criterion: Criterion
}

export default function CriterionRow({ criterion }: CriterionRowProps) {
  const methodology = criterion.methodology ?? []

  return (
    <li className="criterion-row">
      <div className="criterion-line">
        <span className="criterion-code">{criterion.code}</span>
        <span className="criterion-title">{criterion.title}</span>
        {criterion.url && (
          <a
            href={criterion.url}
            target="_blank"
            rel="noreferrer"
            className="criterion-doc"
            aria-label={`Documentation du critère ${criterion.code}`}
          >
            Doc ↗
          </a>
        )}
      </div>

      {methodology.length > 0 && (
        <details className="criterion-methodology">
          <summary>
            Méthodologie du test
            <span className="methodology-count">
              {methodology.length} test{methodology.length > 1 ? 's' : ''}
            </span>
          </summary>
          <div className="methodology-body">
            {methodology.map((entry) => (
              <article key={entry.test} className="methodology-test">
                <h4>Test {entry.test}</h4>
                <div className="methodology-content">
                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        </details>
      )}
    </li>
  )
}
