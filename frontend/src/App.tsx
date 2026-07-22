import { useState, useEffect, useRef } from 'react';
import { getObjects, createObject, updateObject, deleteObject } from './api';
import type { ObjectEntity } from './api';
import './App.css';

function App() {
  const [objects, setObjects] = useState<ObjectEntity[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    const res = await getObjects();
    setObjects(res.data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setPreview('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (!editingId && !imageFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imageFile) formData.append('imageFile', imageFile);

    try {
      if (editingId) {
        await updateObject(editingId, formData);
      } else {
        await createObject(formData);
      }
      resetForm();
      await loadObjects();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (obj: ObjectEntity) => {
    setEditingId(obj._id);
    setTitle(obj.title);
    setDescription(obj.description);
    setPreview(obj.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet objet ?')) return;
    await deleteObject(id);
    await loadObjects();
  };

  return (
    <div className="app">
      <header>
        <h1>Heyama</h1>
        <p>Gestion des objets</p>
      </header>

      <main>
        <section className="form-section">
          <h2>{editingId ? 'Modifier' : 'Créer un objet'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'objet"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'objet"
                required
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editingId}
              />
            </div>
            {preview && (
              <div className="preview">
                <img src={preview} alt="Aperçu" />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Envoi...' : editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="list-section">
          <h2>Objets ({objects.length})</h2>
          {objects.length === 0 ? (
            <p className="empty">Aucun objet pour le moment.</p>
          ) : (
            <div className="grid">
              {objects.map((obj) => (
                <div key={obj._id} className="card">
                  <img src={obj.imageUrl} alt={obj.title} />
                  <div className="card-body">
                    <h3>{obj.title}</h3>
                    <p>{obj.description}</p>
                    <span className="date">
                      {new Date(obj.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(obj)} className="btn-edit">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(obj._id)} className="btn-delete">
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
