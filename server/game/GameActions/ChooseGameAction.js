const GameAction = require('./GameAction');

class ChooseGameAction extends GameAction {
    setDefaultProperties() {
        this.choice = null;
        this.choices = {};
        this.activePromptTitle = 'Select an action:';
    }

    setup() {
        super.setup();
        this.effectMsg = 'do several things';
    }

    update(context) {
        super.update();
        for(const key of Object.keys(this.choices)) {
            if(!Array.isArray(this.choices[key])) {
                this.choices[key] = [this.choices[key]];
            }
        }
        this.gameActions = Object.values(this.choices).reduce((array, actions) => array.concat(actions), []);
        for(let gameAction of this.gameActions) {
            gameAction.update(context);
        }
    }

    setTarget(target) {
        for(let gameAction of this.gameActions) {
            gameAction.setTarget(target);
        }
    }

    preEventHandler(context) {
        super.preEventHandler(context);
        let activePromptTitle = this.activePromptTitle;
        let choices = Object.keys(this.choices);
        let handlers = choices.map(choice => {
            return () => {
                this.choice = choice;
                for(let gameAction of this.choices[choice]) {
                    context.game.queueSimpleStep(() => gameAction.preEventHandler(context));
                }
            };
        });
        context.game.promptWithHandlerMenu(context.player, {activePromptTitle, choices, handlers});
    }

    hasLegalTarget(context) {
        return this.gameActions.some(gameAction => gameAction.hasLegalTarget(context));
    }

    canAffect(target, context) {
        return this.gameActions.some(gameAction => gameAction.canAffect(target, context));
    }

    getEventArray(context) {
        if(!this.choice) {
            return [];
        }
        return this.choices[this.choice].reduce((array, action) => array.concat(action.getEventArray(context)), []);
    }
}

module.exports = ChooseGameAction;
