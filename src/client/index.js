import devClient from './dev.client'
import prodClient from './prod.client'

window.client = process.env.NODE_ENV != 'development' ? prodClient : devClient
if (process.env.NODE_ENV == 'device') window.client = devClient;

(function(doc, win) {
})(document, window)
