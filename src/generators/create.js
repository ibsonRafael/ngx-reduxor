const fs = require('fs-extra');
const snakeCase = require('lodash.snakecase');
// actions
const basicActions = require('../actions/basic-actions');
const crudActions = require('../actions/crud-actions');
const crudEntityActions = require('../actions/crud-entity-actions');

// modules
const modulesActions = require('../actions/modules-actions');

// utils
const validators = require('../validators');

const crudMethods = [
    {name: 'Get', value: 'GET', checked: true},
    {name: 'Create', value: 'CREATE', checked: true}, 
    {name: 'Update', value: 'UPDATE', checked: true}, 
    {name: 'Delete', value: 'DELETE', checked: true}
];
const entityMethods = [
    {name: 'Get', checked: true, value: 'GET'},
    {name: 'Create', checked: true, value: 'CREATE'},
    {name: 'Create many', checked: true, value: 'CREATE_MANY'},
    {name: 'Update', checked: true, value: 'UPDATE'},
    {name: 'Update many', checked: true, value: 'UPDATE_MANY'},
    {name: 'Delete', checked: true, value: 'DELETE'},
    {name: 'Delete many', checked: true, value: 'DELETE_MANY'},
    {name: 'Clear', checked: true, value: 'CLEAR'}
];

module.exports = function(options) {
    return {
        description: 'Generate Actions, Reducers, Services and Effect',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Name for the new store object?',
                validate: name => validators.required(name),
                description: 'object must be singular'
            }, 
            {
                type: 'list',
                name: 'store',
                message: 'What kind of store do you want to generate?',
                choices: ['Basic', 'CRUD', 'Entity'],
                filter: val => val.toUpperCase()
            },
            {
                type: 'input',
                name: 'plural',
                message: answers => `Enter the plural of '${answers.name}':`,
                when: answers => answers.store === 'ENTITY',
                validate: plural => validators.required(plural)
            }, {
                type: 'checkbox',
                name: 'crudMethods',
                message: 'Select which method you want to be implemented:',
                when: answers => answers.store === 'CRUD',
                choices: crudMethods,
                validate: array => validators.minOptionSelected(1, array)
            }, {
                type: 'checkbox',
                name: 'entityMethods',
                message: 'Select which method you want to be implemented:',
                when: answers => answers.store === 'ENTITY',
                choices: entityMethods,
                validate: array => validators.minOptionSelected(1, array)
            }
        ],
        actions: (data) => {
            let actions = [];
            switch (data.store) {
                case 'BASIC': actions = options.IGNORE_SPEC 
                    ? [basicActions.action, basicActions.reducerWithoutSpec, basicActions.effectWithoutSpec, basicActions.serviceWithoutSpec]
                    : [basicActions.action, basicActions.reducer, basicActions.effect, basicActions.service]
                    break;
                case 'CRUD': actions = options.IGNORE_SPEC
                    ? [crudActions.action, crudActions.reducerWithoutSpec, crudActions.effectWithoutSpec, crudActions.serviceWithoutSpec]
                    : [crudActions.action, crudActions.reducer, crudActions.effect, crudActions.service]
                    break;
                case 'ENTITY': actions = options.IGNORE_SPEC
                    ? [crudEntityActions.action, crudEntityActions.selector, crudEntityActions.reducerWithoutSpec, crudEntityActions.effectWithoutSpec, crudEntityActions.serviceWithoutSpec]
                    : [crudEntityActions.action, crudEntityActions.selector, crudEntityActions.reducer, crudEntityActions.effect, crudEntityActions.service]
                    break;
            }

            const indexExists = fs.existsSync(options.BASE_PATH, 'app.store.ts');
            const allEffectsExists = fs.existsSync(options.BASE_PATH, 'all-effects.ts');
            const storeReduxorModuleExists = fs.existsSync(options.BASE_PATH, 'store-reduxor.module.ts');
            actions = indexExists ? actions.concat(modulesActions.updateIndex) : actions.concat(modulesActions.addIndex);
            actions = allEffectsExists ? actions.concat(modulesActions.updateAllEffects) : actions.concat(modulesActions.addAllEffects);
            actions = storeReduxorModuleExists ? actions.concat(modulesActions.updateStoreReduxorModule) : actions.concat(modulesActions.addStoreReduxorModule);

            const actionsFlattened = actions.reduce((a, b) => a.concat(b));
            return actionsFlattened;
        }
    }
}