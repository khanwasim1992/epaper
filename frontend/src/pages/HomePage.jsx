import React from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="container header-wrap">
          <div className="logo">
            <img src="/image/Wachak Logo.PNG" alt="वचक लोकशाहीचा" />
          </div>

          <div className="header-buttons">
            <Link to="/admin" className="btn login-btn">
              <span className="btn-icon">👤</span> Login
            </Link>
            <a
              href="https://epaper.wachaklokshahicha.com/"
              target="_blank"
              rel="noreferrer"
              className="btn epaper-btn"
            >
              <span className="btn-icon">📰</span> Today's e-Paper
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="overlay">
          <div className="overlay-content">
            <h1>लढाई जनसामान्यांच्या हक्काची !</h1>
            <p>
              महाराष्ट्रातील ताज्या घडामोडी, राजकारण, समाजकारण,
              क्रीडा, मनोरंजन आणि स्थानिक बातम्या एका क्लिकवर.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>दैनिक वचक लोकशाहीचा</h2>
              <p>
                सत्तेच्या सिंहासनाला प्रश्नांचा घणाघात, भ्रष्टाचाराच्या बुरुजांवर सत्याचा थेट प्रहार; जनतेच्या हक्कासाठी निर्भीड एल्गार, अन्यायाच्या साम्राज्यावर लोकशाहीचा निर्णायक वार!"
"ना दबावाला शरण, ना पैशांच्या मोहाला वंदन; जनतेच्या न्यायासाठी बेधडक लेखणी, सत्ताधाऱ्यांच्या दुटप्पी चेहऱ्यांचे निडर उघडकरण!
              </p>
              <br />
              <p>
                खोटेपणाच्या अंधारात सत्याची ज्वाला, जनआक्रोशाला देणारा बुलंद आवाज; भ्रष्ट व्यवस्थेच्या मुळावर घाव, वचक लोकशाहीचा म्हणजे जनतेच्या संघर्षाचा लढाऊ साज!"
"जिथे अन्याय तिथे आमचा हल्लाबोल, जिथे भ्रष्टाचार तिथे आमचा थेट सवाल; जनतेच्या विश्वासाचे रणशिंग फुंकणारे, वचक लोकशाहीचा—निर्भीड, निडर आणि बेमिसाल!
              </p>
            </div>

            <div className="epaper-box">
              <h3>आजचा ई-पेपर वाचा</h3>
              <a
                href="https://epaper.wachaklokshahicha.com/"
                target="_blank"
                rel="noreferrer"
                className="big-btn"
              >
                Today's e-Paper
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery">
        <div className="container">
          <h2 className="section-title">ई-पेपर  गॅलरी</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/image/1.PNG" alt="ई-पेपर गॅलरी 1" />
            </div>
            <div className="gallery-item">
              <img src="/image/2.PNG" alt="ई-पेपर गॅलरी 2" />
            </div>
            <div className="gallery-item">
              <img src="/image/3.PNG" alt="ई-पेपर गॅलरी 3" />
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div className="footer-logo">
            <img src="/image/Wachak Logo.PNG" alt="वचक लोकशाहीचा" />
            <p>लढाई जनसामान्यांच्या हक्काची !</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">मुख्यपृष्ठ</a></li>
              <li><a href="#">राजकारण</a></li>
              <li><a href="#">महाराष्ट्र</a></li>
              <li><a href="#">संपर्क</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h3>Services</h3>
            <ul>
              <li>
                <a
                  href="https://epaper.wachaklokshahicha.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  e-Paper
                </a>
              </li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          © 2026 वचक लोकशाहीचा | All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
