class GameAudio {
    constructor() {
        this.synth = new Tone.Synth().toDestination();
        this.notes = ['C4', 'E4', 'G4', 'B4', 'D5', 'F5', 'A5', 'C6', 'E6'];
    }

    playTile(index) {
        const note = this.notes[index % this.notes.length];
        this.synth.triggerAttackRelease(note, '0.2s');
    }

    playSuccess() {
        const now = Tone.now();
        this.synth.triggerAttackRelease('C4', '0.1s', now);
        this.synth.triggerAttackRelease('E4', '0.1s', now + 0.1);
        this.synth.triggerAttackRelease('G4', '0.1s', now + 0.2);
        this.synth.triggerAttackRelease('C5', '0.2s', now + 0.3);
    }

    playError() {
        const now = Tone.now();
        this.synth.triggerAttackRelease('A3', '0.2s', now);
        this.synth.triggerAttackRelease('G3', '0.2s', now + 0.2);
    }
}

const gameAudio = new GameAudio();
