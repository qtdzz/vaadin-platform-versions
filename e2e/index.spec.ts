/**
/// <reference types="intern" />
const {describe, it, before} = intern.getPlugin('interface.bdd');
const {expect} = intern.getPlugin('chai');

import {pollUntilTruthy, Command, Element} from '@theintern/leadfoot';

describe('starter application', () => {
  describe('index page', () => {
    let page: Command<void>;

    before(async context => {
      await context.remote.session.setExecuteAsyncTimeout(30000);
      await context.remote.session.setFindTimeout(30000);
      page = context.remote.get('');
    });

    describe('version view', () => {
      //TODO: test should go here.
    });
  });
});
*/
