import { ParserEngine } from '../../5-engine/parser-engine.js';

export class Test1Parser extends ParserEngine {
    constructor() {
        super('test1');
    }

    // Specifieke parsing logica voor test1
    async customParsing(data) {
        return data;
    }
}