from http.server import SimpleHTTPRequestHandler, HTTPServer

class PrefixHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Serve requests under /bonny-and-bright/* from the repository root
        prefix = '/bonny-and-bright/'
        if path.startswith(prefix):
            path = path[len(prefix):]
            if path == '':
                path = 'index.html'
        # Accept requests for the exact prefix without trailing slash
        if path == '/bonny-and-bright' or path == 'bonny-and-bright':
            path = 'index.html'
        return super().translate_path(path)

if __name__ == '__main__':
    addr = ('', 8000)
    print('Serving on http://localhost:8000/bonny-and-bright/')
    HTTPServer(addr, PrefixHandler).serve_forever()
