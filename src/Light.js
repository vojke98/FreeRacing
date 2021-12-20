export class Light {

    constructor(node) {
        this.source = node;

        Object.assign(this, {
            ambientColor     : [.8, .8, .8],
            diffuseColor     : [.4, .4, .4],
            specularColor    : [0, 0, 0],
            shininess        : 10,
            attenuatuion     : [1.0, 0, 0.02]
        });
    }

}