import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

const QRGenerator = () => {
  const [content, setContent] = useState('');
  const [size, setSize] = useState(300);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [logoFile, setLogoFile] = useState(null);
  const [logoSize, setLogoSize] = useState(60);
  const [logoStyle, setLogoStyle] = useState('circular');
  const [showLogo, setShowLogo] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [notification, setNotification] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('content'); // For mobile tabs
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 3000);
  };

  const generateQR = async () => {
    if (!content.trim() || !canvasRef.current) return;
    
    try {
      // Generate base QR code
      await QRCode.toCanvas(canvasRef.current, content, {
        width: size,
        color: { dark: darkColor, light: lightColor },
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      // Add logo if enabled
      if (showLogo && logoFile) {
        const ctx = canvasRef.current.getContext('2d');
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        logoImg.onload = () => {
          const canvas = canvasRef.current;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;
          
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          
          if (logoStyle === 'circular') {
            ctx.beginPath();
            ctx.arc(logoX + logoSize/2, logoY + logoSize/2, (logoSize/2) + 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
            ctx.clip();
          } else {
            ctx.fillRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16);
          }
          
          ctx.globalAlpha = logoOpacity;
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        };
        
        logoImg.onerror = () => {
          showNotification('Error loading logo image', 'error');
        };
        
        logoImg.src = logoFile;
      }
    } catch (err) {
      console.error('QR generation error:', err);
      showNotification('Error generating QR code', 'error');
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current || !content.trim()) return;
    
    try {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('QR code downloaded successfully!');
    } catch (error) {
      showNotification('Error downloading QR code', 'error');
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Logo file too large. Please use a file under 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoFile(e.target.result);
      setShowLogo(true);
      showNotification('Logo uploaded successfully!');
    };
    reader.onerror = () => {
      showNotification('Error reading logo file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setShowLogo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showNotification('Logo removed');
  };

  useEffect(() => {
    if (content.trim()) {
      generateQR();
    }
  }, [content, size, darkColor, lightColor, logoFile, logoSize, logoStyle, showLogo, logoOpacity]);

  // Remove loading screen when component mounts
  useEffect(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      setTimeout(() => {
        loading.style.display = 'none';
      }, 500);
    }
  }, []);

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: isMobile ? '10px' : '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    textAlign: 'center',
    color: 'white',
    fontSize: isMobile ? '2rem' : '3rem',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    padding: isMobile ? '0 10px' : '0'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '20px' : '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'start'
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.95)',
    padding: isMobile ? '20px' : '30px',
    borderRadius: isMobile ? '15px' : '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    margin: isMobile ? '0' : 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '10px' : '12px',
    border: '2px solid #e1e5e9',
    borderRadius: isMobile ? '8px' : '10px',
    fontSize: isMobile ? '14px' : '16px',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
    fontSize: isMobile ? '14px' : '16px'
  };

  const buttonStyle = {
    padding: isMobile ? '10px 16px' : '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  // Mobile tab styles
  const tabButtonStyle = {
    flex: 1,
    padding: '12px 8px',
    border: 'none',
    background: 'transparent',
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    color: '#667eea',
    borderBottomColor: '#667eea'
  };

  return (
    <div style={containerStyle}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          left: isMobile ? '10px' : 'auto',
          zIndex: 1000,
          padding: isMobile ? '10px 15px' : '12px 20px',
          borderRadius: '8px',
          color: 'white',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          background: notification.type === 'error' ? '#e74c3c' : '#27ae60',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          {notification.message}
        </div>
      )}

      <h1 style={headerStyle}>🎯 QR Generator Pro</h1>
      <p style={{ 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: isMobile ? '1rem' : '1.2rem', 
        marginBottom: isMobile ? '30px' : '40px',
        padding: isMobile ? '0 20px' : '0'
      }}>
        Professional QR Code Generator {!isMobile && 'with Logo Support'}
      </p>

      <div style={gridStyle}>
        {/* Controls */}
        <div style={cardStyle}>
          {/* Mobile Tabs */}
          {isMobile && (
            <div style={{ 
              display: 'flex', 
              marginBottom: '20px', 
              borderBottom: '1px solid #eee',
              overflowX: 'auto'
            }}>
              <button
                style={activeSection === 'content' ? activeTabStyle : tabButtonStyle}
                onClick={() => setActiveSection('content')}
              >
                Content
              </button>
              <button
                style={activeSection === 'design' ? activeTabStyle : tabButtonStyle}
                onClick={() => setActiveSection('design')}
              >
                Design
              </button>
              <button
                style={activeSection === 'logo' ? activeTabStyle : tabButtonStyle}
                onClick={() => setActiveSection('logo')}
              >
                Logo
              </button>
            </div>
          )}

          <h2 style={{ 
            marginTop: 0, 
            color: '#333', 
            marginBottom: isMobile ? '20px' : '30px',
            fontSize: isMobile ? '1.3rem' : '1.5rem'
          }}>
            {isMobile ? `${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings` : 'Customize Your QR Code'}
          </h2>
          
          {/* Content Section */}
          {(!isMobile || activeSection === 'content') && (
            <>
              <div style={{ marginBottom: isMobile ? '20px' : '25px' }}>
                <label style={labelStyle}>Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter URL, text, phone number, email, or any content..."
                  style={{ 
                    ...inputStyle, 
                    height: isMobile ? '80px' : '100px', 
                    resize: 'vertical' 
                  }}
                />
                <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                  {content.length} characters
                </p>
              </div>

              {/* Quick Examples for Mobile */}
              {isMobile && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Quick Examples</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: '🌐 Website', example: 'https://example.com' },
                      { label: '📧 Email', example: 'mailto:hello@example.com' },
                      { label: '📞 Phone', example: 'tel:+1234567890' },
                      { label: '📶 WiFi', example: 'WIFI:T:WPA;S:Network;P:Password;;' }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setContent(item.example)}
                        style={{
                          ...buttonStyle,
                          padding: '8px',
                          background: '#f8f9fa',
                          color: '#333',
                          border: '1px solid #ddd',
                          fontSize: '11px',
                          textAlign: 'center'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Design Section */}
          {(!isMobile || activeSection === 'design') && (
            <>
              <div style={{ marginBottom: isMobile ? '20px' : '25px' }}>
                <label style={labelStyle}>QR Code Size: {size}px</label>
                <input
                  type="range"
                  min="200"
                  max="500"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '15px', 
                marginBottom: isMobile ? '20px' : '25px' 
              }}>
                <div>
                  <label style={labelStyle}>Dark Color</label>
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: isMobile ? '40px' : '50px', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer' 
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Light Color</label>
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: isMobile ? '40px' : '50px', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer' 
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Logo Section */}
          {(!isMobile || activeSection === 'logo') && (
            <div style={{ 
              marginBottom: isMobile ? '20px' : '25px', 
              padding: isMobile ? '15px' : '20px', 
              background: '#f8f9fa', 
              borderRadius: '12px' 
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: '15px', 
                color: '#333',
                fontSize: isMobile ? '1.1rem' : '1.2rem'
              }}>
                🖼️ Logo Options
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Upload Logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                />
                <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                  PNG, JPG, GIF, SVG (max 5MB)
                </p>
              </div>

              {logoFile && (
                <>
                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <img 
                      src={logoFile} 
                      alt="Logo preview" 
                      style={{ 
                        maxWidth: isMobile ? '80px' : '100px', 
                        maxHeight: isMobile ? '80px' : '100px', 
                        borderRadius: logoStyle === 'circular' ? '50%' : '8px',
                        border: '2px solid #ddd',
                        objectFit: 'cover'
                      }} 
                    />
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                    gap: '15px', 
                    marginBottom: '15px' 
                  }}>
                    <div>
                      <label style={labelStyle}>Size: {logoSize}px</label>
                      <input
                        type="range"
                        min="30"
                        max="120"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Opacity: {Math.round(logoOpacity * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={logoOpacity}
                        onChange={(e) => setLogoOpacity(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Logo Style</label>
                    <select
                      value={logoStyle}
                      onChange={(e) => setLogoStyle(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="circular">Circular</option>
                      <option value="square">Square</option>
                    </select>
                  </div>

                  <button
                    onClick={removeLogo}
                    style={{
                      ...buttonStyle,
                      background: '#e74c3c',
                      color: 'white',
                      width: '100%'
                    }}
                  >
                    🗑️ Remove Logo
                  </button>
                </>
              )}
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={downloadQR}
            disabled={!content.trim()}
            style={{
              ...buttonStyle,
              width: '100%',
              padding: isMobile ? '12px' : '15px',
              background: content.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ccc',
              color: 'white',
              fontSize: isMobile ? '16px' : '18px',
              cursor: content.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            📥 Download QR Code
          </button>
        </div>

        {/* Preview */}
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2 style={{ 
            marginTop: 0, 
            color: '#333', 
            marginBottom: isMobile ? '20px' : '30px',
            fontSize: isMobile ? '1.3rem' : '1.5rem'
          }}>
            Preview
          </h2>
          
          {content.trim() ? (
            <div>
              <div style={{
                display: 'inline-block',
                padding: isMobile ? '15px' : '20px',
                background: '#f8f9fa',
                borderRadius: '15px',
                marginBottom: isMobile ? '15px' : '20px',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
              
              <div style={{ 
                textAlign: 'left', 
                background: '#f8f9fa', 
                padding: isMobile ? '12px' : '15px', 
                borderRadius: '10px',
                fontSize: isMobile ? '12px' : '14px'
              }}>
                <h4 style={{ 
                  marginTop: 0, 
                  marginBottom: '8px', 
                  color: '#333',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  QR Code Details
                </h4>
                <p style={{ color: '#666', margin: '4px 0' }}>
                  <strong>Content:</strong> {content.length > (isMobile ? 30 : 50) ? content.substring(0, isMobile ? 30 : 50) + '...' : content}
                </p>
                <p style={{ color: '#666', margin: '4px 0' }}>
                  <strong>Size:</strong> {size}×{size}px
                </p>
                <p style={{ color: '#666', margin: '4px 0' }}>
                  <strong>Logo:</strong> {logoFile ? `Yes (${logoSize}px, ${logoStyle})` : 'No'}
                </p>
                <p style={{ color: '#666', margin: '4px 0' }}>
                  <strong>Characters:</strong> {content.length}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: isMobile ? '40px 20px' : '60px 20px', color: '#999' }}>
              <div style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '15px' }}>📱</div>
              <h3 style={{ 
                marginBottom: '10px', 
                color: '#666',
                fontSize: isMobile ? '1.1rem' : '1.3rem'
              }}>
                Enter Content
              </h3>
              <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                Add your content {isMobile ? 'above' : 'to the left'} to generate a QR code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Examples - Desktop Only */}
      {!isMobile && (
        <div style={{ ...cardStyle, marginTop: '30px' }}>
          <h2 style={{ marginTop: 0, color: '#333', textAlign: 'center', marginBottom: '25px' }}>Quick Examples</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {[
              { 
                label: '🌐 Website URL', 
                example: 'https://your-website.com',
                description: 'Link to any website'
              },
              { 
                label: '📧 Email Contact', 
                example: 'mailto:hello@example.com?subject=Hello&body=Hi there!',
                description: 'Pre-filled email'
              },
              { 
                label: '📞 Phone Number', 
                example: 'tel:+1234567890',
                description: 'Direct phone call'
              },
              { 
                label: '📱 SMS Message', 
                example: 'sms:+1234567890?body=Hello from QR code!',
                description: 'Pre-filled text message'
              },
              { 
                label: '📶 WiFi Network', 
                example: 'WIFI:T:WPA;S:YourNetworkName;P:YourPassword;;',
                description: 'Instant WiFi connection'
              }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setContent(item.example)}
                style={{
                  ...buttonStyle,
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  textAlign: 'left',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px' }}>
                  {item.description}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'monospace' }}>
                  {item.example.length > 40 ? item.example.substring(0, 40) + '...' : item.example}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: isMobile ? '30px' : '40px', 
        color: 'rgba(255,255,255,0.8)',
        fontSize: isMobile ? '12px' : '14px',
        padding: isMobile ? '0 20px' : '0'
      }}>
      </div>
    </div>
  );
};

export default QRGenerator;
