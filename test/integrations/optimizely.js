
describe('Optimizely', function () {

  var Optimizely = require('integrations/lib/optimizely');
  var analytics = require('analytics');
  var assert = require('assert');
  var sinon = require('sinon');
  var tick = require('next-tick');

  var optimizely;
  var settings = {};

  beforeEach(function () {
    analytics.use(Optimizely);
    optimizely = new Optimizely.Integration(settings);
    // setup fake optimizely experiment data
    window.optimizely.data = {
      experiments : { 0 : { name : 'Test' } },
      state : { variationNamesMap : { 0 : 'Variation' } }
    };
  });

  afterEach(function () {
    optimizely.reset();
  });

  describe('#initialize', function () {
    it('should call #replay by default', function (done) {
      optimizely.replay = sinon.spy();
      optimizely.initialize();
      tick(function () {
        assert(optimizely.replay.called);
        done();
      });
    });

    it('should not call #replay if variations are disabled', function (done) {
      optimizely.replay = sinon.spy();
      optimizely.options.variations = false;
      optimizely.initialize();
      tick(function () {
        assert(!optimizely.replay.called);
        done();
      });
    });
  });

  describe('#replay', function (done) {
    beforeEach(function () {
      sinon.stub(analytics, 'identify');
    });

    afterEach(function () {
      analytics.identify.restore();
    });

    it('should replay variation traits', function () {
      optimizely.replay();
      assert(analytics.identify.calledWith({
        'Experiment: Test': 'Variation'
      }));
    });
  });

  describe('#track', function () {
    beforeEach(function () {
      optimizely.initialize();
      window.optimizely.push = sinon.spy();
    });

    it('should send an event', function () {
      optimizely.track('event');
      assert(window.optimizely.push.calledWith(['trackEvent', 'event', {}]));
    });

    it('should send an event and properties', function () {
      optimizely.track('event', { property: true });
      assert(window.optimizely.push.calledWith(['trackEvent', 'event', {
        property: true
      }]));
    });

    it('should change revenue to cents', function () {
      optimizely.track('event', { revenue: 9.99 });
      assert(window.optimizely.push.calledWith(['trackEvent', 'event', {
        revenue: 999
      }]));
    });
  });

});