// src/App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

// Composant Loader amélioré
const LoadingSpinner = () => (
  <div className="loading-screen">
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p>Chargement de votre espace...</p>
    </div>
  </div>
);

function App({ keycloak }) {
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const token = keycloak.token;

  useEffect(() => {
    setLoading(true);

    // Infos utilisateur
    axios
      .get("http://localhost:8081/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserInfo(res.data))
      .catch(console.error);

    // Liste des cours
    axios
      .get("http://localhost:8081/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const logout = () => keycloak.logout();

  if (loading) return <LoadingSpinner />;

  const isAdmin = userInfo.realm_access?.roles.includes("ROLE_ADMIN");

  return (
    <div className="app-container">
      {/* Header élégant */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">📚</span>
              <div>
                <h1 className="app-title">E-Learning Platform</h1>
                <p className="app-subtitle">Plateforme d'apprentissage</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                {userInfo.preferred_username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <span className="user-name">{userInfo.preferred_username}</span>
                <span className="user-email">{userInfo.email}</span>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={logout}
              title="Déconnexion"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Section de bienvenue */}
        <div className="welcome-section">
          <h2>Bienvenue, {userInfo.preferred_username}!</h2>
          <p>Explorez les cours disponibles sur notre plateforme.</p>
        </div>

        {/* Section des cours */}
        <section className="courses-section">
          <div className="section-header">
            <h2>
              <span className="section-icon">📚</span>
              Cours disponibles
            </h2>
            <div className="courses-count">{courses.length} cours</div>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Aucun cours disponible</h3>
              <p>Les cours seront ajoutés prochainement</p>
            </div>
          ) : (
            <div className="courses-list">
              {courses.map((course) => (
                <div className="course-item" key={course.id}>
                  <div className="course-content">
                    <div className="course-title-wrapper">
                      <h3 className="course-title">{course.title}</h3>
                      {course.id === 1 && (
                        <span className="course-tag">Démo</span>
                      )}
                    </div>
                    <p className="course-description">{course.description}</p>
                  </div>
                  <div className="course-id">#{course.id}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section Admin */}
        {isAdmin && (
          <section className="admin-section">
            <div className="section-header">
              <h2>
                <span className="admin-icon">⚙️</span>
                Ajouter un nouveau cours
              </h2>
              <p className="section-subtitle">Réservé aux administrateurs</p>
            </div>
            <AddCourseForm token={token} setCourses={setCourses} />
          </section>
        )}
      </main>

      {/* Footer élégant */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p className="footer-copyright">
              © 2025 Plateforme E-Learning
            </p>
            <div className="footer-user">
              Connecté en tant que : {userInfo.preferred_username}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AddCourseForm({ token, setCourses }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    axios
      .post(
        "http://localhost:8081/api/courses",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setCourses((prev) => [...prev, res.data]);
        setTitle("");
        setDescription("");
        // Notification visuelle
        showToast("✅ Cours ajouté avec succès !", "success");
      })
      .catch((err) => {
        const message = err.response?.status === 403
          ? "❌ Accès refusé - Admin uniquement"
          : "❌ Erreur lors de l'ajout";
        showToast(message, "error");
      })
      .finally(() => setSubmitting(false));
  };

  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <div className="add-course-container">
      <form className="add-course-form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="course-title">
            Titre du cours
          </label>
          <input
            id="course-title"
            type="text"
            placeholder="Ex: Introduction à React.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="course-description">
            Description
          </label>
          <textarea
            id="course-description"
            placeholder="Décrivez le contenu du cours..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={submitting}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-clear"
            onClick={() => {
              setTitle("");
              setDescription("");
            }}
            disabled={submitting}
          >
            Effacer
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting || !title.trim()}
          >
            {submitting ? (
              <>
                <span className="loading-spinner-mini"></span>
                Ajout en cours...
              </>
            ) : (
              "Ajouter le cours"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;