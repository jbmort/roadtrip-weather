import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// import { mapProvider } from './roadtrip/map/provider.ts';
import { provideAnimations } from '@angular/platform-browser/animations';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export const mapProvider = {
  provide: 'OL_MAP',
  useFactory: () => {
    return new Map({
      view: new View({
        center: [0, 0],
        zoom: 2
      }),
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ]
    });
  }
};


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
              provideHttpClient(),
              mapProvider,
              provideAnimations(),
              
  ]
  
};
