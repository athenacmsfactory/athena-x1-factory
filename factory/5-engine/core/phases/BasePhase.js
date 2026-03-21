/**
 * BasePhase.js
 * @description Abstract base class for Athena generation phases.
 */
export class BasePhase {
    constructor(name) {
        this.name = name;
    }

    /**
     * Executes the phase logic.
     * @param {Object} context - The shared generation context.
     */
    async execute(context) {
        throw new Error(`Phase [${this.name}] must implement execute(context)`);
    }

    log(msg) {
        console.log(`[Phase: ${this.name}] ${msg}`);
    }
}
