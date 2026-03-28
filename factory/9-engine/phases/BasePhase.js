export default class BasePhase {
    constructor(name) {
        this.name = name;
    }

    log(message) {
        console.log(`[Phase: ${this.name}] ${message}`);
    }

    async execute(ctx) {
        throw new Error('Execute method must be implemented by concrete phase.');
    }
}
