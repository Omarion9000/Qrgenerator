from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import qrcode
from io import BytesIO
import base64
import re
import os

app = Flask(__name__)
CORS(app)

def is_valid_url(url):
    # Simple URL validation
    regex = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # or IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(regex, url) is not None

@app.route('/api/generate-qr', methods=['POST'])
def generate_qr():
    data = request.json
    content = data.get('content', '')
    
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    # If content looks like a URL, validate it
    if content.startswith(('http://', 'https://')):
        if not is_valid_url(content):
            return jsonify({'error': 'Invalid URL format'}), 400
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(content)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to BytesIO object
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    # Convert to base64 for sending to frontend
    img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
    
    return jsonify({
        'qr_code': f'data:image/png;base64,{img_base64}',
        'content': content
    })

@app.route('/api/download-qr', methods=['POST'])
def download_qr():
    data = request.json
    content = data.get('content', '')
    
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(content)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to BytesIO object
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='qrcode.png')

@app.route('/')
def home():
    return "QR Code Generator API is running!"



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Usa el puerto asignado por Render
    app.run(host='0.0.0.0', port=port, debug=True)
