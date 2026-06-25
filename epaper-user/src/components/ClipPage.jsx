import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { publicApi } from '../utils/api';
import { Header } from '../components/Header';

const decodeSlug = (slug = '') => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b[a-z]/g, (ch) => ch.toUpperCase())
    .trim() || 'News Clipping'
}

export default function ClipPage() {
  const { epaperId, pageNum, slug, crop } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [x, y, w, h] = crop
    ? crop.split('-')
    : [params.get('x'), params.get('y'), params.get('w'), params.get('h')];

  const title = params.get('title') || decodeSlug(slug);

  const cropUrl = publicApi.cropUrl(epaperId, pageNum, x, y, w, h);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showControls={false} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', background: '#111' }}>
        <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 20, color: 'var(--text)' }}>{title}</h1>
          
          <div style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: 8, overflow: 'hidden', background: '#fff', lineHeight: 0 }}>
            <img 
              src={cropUrl} 
              alt={title} 
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }} 
            />
          </div>

          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: 30,
              padding: '12px 24px',
              borderRadius: 6,
              background: 'var(--accent)',
              border: 'none',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Read Today's Full ePaper
          </button>
        </div>
      </main>

      <footer style={{ background: 'var(--header)', borderTop: '1px solid #2a2a2a', padding: '20px', textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>
        © {new Date().getFullYear()} Wachak Lokshahicha · All rights reserved
      </footer>
    </div>
  );
}