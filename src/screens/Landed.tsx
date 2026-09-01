import { Asterisk } from '../brand'
import { landed } from '../content'

export default function Landed({ onAnother }: { onAnother: () => void }) {
  return (
    <section>
      <Asterisk size={40} className="saved-mark" />
      <h1 className="h1">{landed.head}</h1>
      <p className="lead">{landed.line}</p>
      <div className="actions">
        <button className="btn btn-lg btn-secondary" type="button" onClick={onAnother}>
          {landed.again}
        </button>
      </div>
    </section>
  )
}
