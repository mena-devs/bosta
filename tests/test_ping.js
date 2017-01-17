const assert = require('assert');
const { describe, it, setup, suite } = require('mocha');

const plugin = require('../plugins/ping.js');


suite('Ping Plugin Tests', function () {
    setup(function () {
        this.bot = {
            self: {
                id: 'bosta',
            },
        };

        this.rtm = {
            sent: [],
            sendMessage(message, channel) {
                this.sent.push([message, channel]);
            },
        };
    });

    describe('on ping message', function () {
        it('should send pong to same channel', function () {
            const message = { text: '<@bosta> ping', channel: 'general' };
            plugin.handlePing(this.bot, this.rtm, message);
            assert.deepEqual(['pong', 'general'], this.rtm.sent[0]);
        });
    });

    describe('on ping message to someone else', function () {
        it('should do nothing', function () {
            const message = { text: '<@john> ping', channel: 'general' };
            plugin.handlePing(this.bot, this.rtm, message);
            assert.deepEqual([], this.rtm.sent);
        });
    });
});
