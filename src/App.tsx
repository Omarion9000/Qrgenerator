import React, { useState } from 'react';
import { QrCode, Download, Trash2, Link, FileText, AlertCircle, Settings, History } from 'lucide-react';
import QRCode from 'qrcode';

function App() {
  const [content, setContent] = useState('');
  const [qrCodes, setQrCodes] = useState<{ content: string; qrCode: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const generateQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content to generate a QR code');
      return;
    }
    
    // If content looks like a URL, validate it
    if (content.startsWith(('http://')) || content.startsWith(('https://'))) {
      if (!isValidUrl(content)) {
        setError('Invalid URL format');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate QR code directly in the browser
      const qrCodeDataUrl = await QRCode.toDataURL(content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b', // Slate-800
          light: '#ffffff'
        }
      });
      
      setQrCodes([...qrCodes, { 
        content: content, 
        qrCode: qrCodeDataUrl 
      }]);
      setContent('');
      setActiveTab('history');
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCode: string, content: string) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${content.substring(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeQRCode = (index: number) => {
    const newQrCodes = [...qrCodes];
    newQrCodes.splice(index, 1);
    setQrCodes(newQrCodes);
  };

  const getContentIcon = (content: string) => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return <Link className="w-4 h-4 mr-1" />;
    }
    return <FileText className="w-4 h-4 mr-1" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        <header className="text-center mb-10 pt-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-full shadow-lg">
              <QrCode className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">QR Code Generator</h1>
          <p className="text-slate-600 mt-2 text-lg">Create professional QR codes instantly</p>
        </header>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-10">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'generate' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center justify-center">
                <QrCode className="w-5 h-5 mr-2" />
                Generate
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'history' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center justify-center">
                <History className="w-5 h-5 mr-2" />
                History {qrCodes.length > 0 && `(${qrCodes.length})`}
              </div>
            </button>
          </div>

          {activeTab === 'generate' && (
            <div className="p-8">
              <form onSubmit={generateQRCode} className="space-y-6">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                    Enter URL or text
                  </label>
                  <input
                    type="text"
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="https://example.com or any text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center justify-center shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-8">
              {qrCodes.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                    <History className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No QR codes yet</h3>
                  <p className="mt-1 text-sm text-slate-500">Generate your first QR code to see it here.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab('generate')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <QrCode className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Create QR Code
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {qrCodes.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 flex justify-center">
                        <img src={item.qrCode} alt="QR Code" className="w-48 h-48" />
                      </div>
                      
                      <div className="p-6">
                        <div className="mb-4">
                          <div className="flex items-center text-sm text-slate-600 mb-2">
                            {getContentIcon(item.content)}
                            <span className="font-medium">Content:</span>
                          </div>
                          <p className="text-slate-800 truncate font-medium">{item.content}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadQRCode(item.qrCode, item.content)}
                            className="flex-1 flex items-center justify-center bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                          <button
                            onClick={() => removeQRCode(index)}
                            className="flex items-center justify-center bg-slate-100 text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition-colors"
                            aria-label="Remove QR code"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="text-center text-slate-500 text-sm py-6">
          <p>Developed by Omar Serrano</p>
        </footer>
      </div>
    </div>
  );
}

export default App;