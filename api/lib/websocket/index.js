import Joi from 'joi';
import _ from 'lodash';
import RequireDir from 'require-dir';
import {
    MODEL_ALL,
    NOHM_SUB_ALL
} from '../../util/constants';

const schema = {
    model: Joi
        .string()
        .required()
        .valid(MODEL_ALL)
        .description('Model'),
    subscribePath: Joi
        .string()
        .required()
        .description('subscribePath'),
    publishPath: Joi
        .func()
        .required()
        .description('publishPath'),
    actions: Joi
        .array()
        .items(Joi.string().valid(NOHM_SUB_ALL))
        .required()
        .description('Actions')
};

module.exports = async (server) => {

    const { 'redis-messaging': rm } = server.app;
    const WebSockets = await RequireDir('.');

    await Promise.all(_.map(WebSockets, async (ws, key) => {

        const validation = Joi.validate(ws, schema);
        if (validation.error) {

            return Promise.reject(`The WebSocket [${key}.js] is not valid.\n${validation.error}`);
        }
        try {
            const model = await rm.factory(ws.model);
            if (!model.getPublish()) {

                return Promise.reject(`The model [${ws.model}] is not configured to publish.`);
            }
            server.subscription(ws.subscribePath);
            await Promise.all(_.map(ws.actions, async (action) => {

                await model.subscribe(action, (event) => {

                    const { target } = event;
                    server.publish(ws.publishPath({ properties: target.properties }), target.properties);
                });
            }));
        }
        catch (error) {

            throw Error(error);
        }
    }));
};
