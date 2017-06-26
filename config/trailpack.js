/**
 * Trailpack Configuration
 *
 * @see {@link http://trailsjs.io/doc/trailpack/config
 */
module.exports = {
  type: 'misc',
  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other trailpacks.
   */
  lifecycle: {
    configure: {
      /**
       * List of events that must be fired before the configure lifecycle
       * method is invoked on this Trailpack
       */
      listen: [
        'trailpack:sequelize:configured',
        'trailpack:proxy-engine:configured',
        'trailpack:proxy-generics:configured',
        'trailpack:proxy-permissions:configured'
      ],

      /**
       * List of events emitted by the configure lifecycle method
       */
      emit: [
        'trailpack:proxy-cart:configured'
      ]
    },
    initialize: {
      listen: [
        'trailpack:sequelize:initialized',
        'trailpack:proxy-engine:initialized',
        'trailpack:proxy-permissions:initialized',
        'trailpack:proxy-generics:initialized'
      ],
      emit: [
        'trailpack:proxy-cart:initialized'
      ]
    }
  }
}

