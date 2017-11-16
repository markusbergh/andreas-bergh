var require = {
  'baseUrl': '/js',
  'paths': {
    'jquery': 'vendor/jquery-1.11.1.min',
    'transit': 'vendor/jquery.transit-0.9.12',
    'snapsvg': 'vendor/snap.svg',
    'easing': 'vendor/snap.svg.easing',
    'waveform': 'vendor/waveform-1.0.0',
    'waypoints': 'vendor/jquery.waypoints-3.1.1',
    'smartresize': 'andreasbergh/utils/abSmartResize',
    'pubsub': 'andreasbergh/utils/abPubSub',
    // Own dependencies
    'controllers': 'andreasbergh/controllers',
    'visuals': 'andreasbergh/visuals',
    'modules': 'andreasbergh/modules',
    'models': 'andreasbergh/models',
    'utils': 'andreasbergh/utils'
  },
  'shim': {
    'snapsvg': {
      exports: 'Snap'
    },
    'easing': {
      deps: ['snapsvg'],
      exports: 'mina'
    },
    'waveform': {
      exports: 'Waveform'
    },
    'waypoints': {
      exports: 'Waypoint'
    },
    'smartresize': {
      deps: ['jquery']
    }
  }
};
