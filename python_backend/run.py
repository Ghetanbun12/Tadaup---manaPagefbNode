from app import create_app
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Restructured Python Backend running at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
