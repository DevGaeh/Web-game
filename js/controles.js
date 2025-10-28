export const CONTROLES = {
    teclas: new Set(),
    iniciar() {
        window.addEventListener('keydown', (e) => {
            this.teclas.add(e.code);
        });
        window.addEventListener('keyup', (e) => {
            this.teclas.delete(e.code);
        })
    },
    estaPresionada(code){
        return this.teclas.has(code);
    }
}