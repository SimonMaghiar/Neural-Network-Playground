import { glossary, glossaryAnchor } from '../../ui/glossary'

const terms = Object.entries(glossary).sort(([a], [b]) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

export default function Glossary() {
  return (
    <dl className="glossary-list">
      {terms.map(([term, definition]) => (
        <div key={term} id={glossaryAnchor(term)} className="glossary-entry">
          <dt>
            <a href={`#${glossaryAnchor(term)}`}>{term}</a>
          </dt>
          <dd>{definition}</dd>
        </div>
      ))}
    </dl>
  )
}
