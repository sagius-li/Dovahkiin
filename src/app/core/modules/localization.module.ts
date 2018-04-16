import { NgModule } from '@angular/core';

import { HttpModule } from '@angular/http'; // only for TranslationModule
import {
  TranslationModule,
  L10nConfig,
  ProviderType,
  StorageStrategy,
  L10nLoader
} from 'angular-l10n';

const l10nConfig: L10nConfig = {
  locale: {
    languages: [
      { code: 'en', dir: 'ltr' },
      { code: 'de', dir: 'ltr' },
      { code: 'cn', dir: 'ltr' }
    ],
    language: 'en',
    storage: StorageStrategy.Cookie
  },
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: '../../assets/locale-' }
    ],
    caching: true,
    missingValue: 'No key'
  }
};

@NgModule({
  imports: [
    HttpModule, // only for TranslationModule
    TranslationModule.forRoot(l10nConfig),
  ],
  exports: [
    TranslationModule
  ]
})
export class LocalizationModule {
  constructor(public l10nLoader: L10nLoader) {
    l10nLoader.load();
  }
}
