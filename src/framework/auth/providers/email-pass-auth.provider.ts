/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs/observable/of';
import { switchMap } from 'rxjs/operators/switchMap';
import { map } from 'rxjs/operators/map';
import { catchError } from 'rxjs/operators/catchError';

import { NgEmailPassAuthProviderConfig } from './email-pass-auth.options';
import { NbAuthResult } from '../services/auth-result';
import { NbAbstractAuthProvider } from './abstract-auth.provider';
import { getDeepFromObject } from '../helpers';

/**
 * The most common authentication provider for email/password strategy.
 *
 *
 * @example
 *
 * Default settings object:
 *
 * ```
 * {
 *  baseEndpoint: '',
 *  login: {
 *    alwaysFail: false,
 *    rememberMe: true,
 *    endpoint: '/api/auth/login',
 *    method: 'post',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *    defaultErrors: ['Login/Email combination is not correct, please try again.'],
 *    defaultMessages: ['You have been successfully logged in.'],
 *  },
 *  register: {
 *    alwaysFail: false,
 *    rememberMe: true,
 *    endpoint: '/api/auth/register',
 *    method: 'post',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *    defaultErrors: ['Something went wrong, please try again.'],
 *    defaultMessages: ['You have been successfully registered.'],
 *  },
 *  logout: {
 *    alwaysFail: false,
 *    endpoint: '/api/auth/logout',
 *    method: 'delete',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *    defaultErrors: ['Something went wrong, please try again.'],
 *    defaultMessages: ['You have been successfully logged out.'],
 *  },
 *  requestPass: {
 *    endpoint: '/api/auth/request-pass',
 *    method: 'post',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *    defaultErrors: ['Something went wrong, please try again.'],
 *    defaultMessages: ['Reset password instructions have been sent to your email.'],
 *  },
 *  resetPass: {
 *    endpoint: '/api/auth/reset-pass',
 *    method: 'put',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *    resetPasswordTokenKey: 'reset_password_token',
 *    defaultErrors: ['Something went wrong, please try again.'],
 *    defaultMessages: ['Your password has been successfully changed.'],
 *  },
 *  refreshToken: {
 *    endpoint: '/api/auth/refresh-token',
 *    method: 'post',
 *    redirect: {
 *      success: null,
 *      failure: null,
 *    },
 *    defaultErrors: ['Something went wrong, please try again.'],
 *    defaultMessages: ['Your token has been successfully refreshed.'],
 *  },
 *  token: {
 *    key: 'data.token',
 *    getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
 *      this.getConfigValue('token.key')),
 *  },
 *  errors: {
 *    key: 'data.errors',
 *    getter: (module: string, res: HttpErrorResponse) => getDeepFromObject(res.error,
 *      this.getConfigValue('errors.key'),
 *      this.getConfigValue(`${module}.defaultErrors`)),
 *  },
 *  messages: {
 *    key: 'data.messages',
 *    getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
 *      this.getConfigValue('messages.key'),
 *      this.getConfigValue(`${module}.defaultMessages`)),
 *  },
 *}
 *
 * // Note, there is no need to copy over the whole object to change the settings you need.
 * // Also, this.getConfigValue call won't work outside ofthe default config declaration
 * // (which is inside of the `NbEmailPassAuthProvider` class), so you have to replace it with a custom helper function
 * // if you need it.
 * ```
 */
@Injectable()
export class NbEmailPassAuthProvider extends NbAbstractAuthProvider {

  protected defaultConfig: NgEmailPassAuthProviderConfig = {
    baseEndpoint: '/api/auth/',
    login: {
      alwaysFail: false,
      rememberMe: true, // TODO: what does that mean?
      endpoint: 'login',
      method: 'post',
      redirect: {
        success: '/',
        failure: null,
      },
      defaultErrors: ['Login/Email combination is not correct, please try again.'],
      defaultMessages: ['You have been successfully logged in.'],
    },
    register: {
      alwaysFail: false,
      rememberMe: true,
      endpoint: 'register',
      method: 'post',
      redirect: {
        success: '/',
        failure: null,
      },
      defaultErrors: ['Something went wrong, please try again.'],
      defaultMessages: ['You have been successfully registered.'],
    },
    logout: {
      alwaysFail: false,
      endpoint: 'logout',
      method: 'delete',
      redirect: {
        success: '/',
        failure: null,
      },
      defaultErrors: ['Something went wrong, please try again.'],
      defaultMessages: ['You have been successfully logged out.'],
    },
    requestPass: {
      endpoint: 'request-pass',
      method: 'post',
      redirect: {
        success: '/',
        failure: null,
      },
      defaultErrors: ['Something went wrong, please try again.'],
      defaultMessages: ['Reset password instructions have been sent to your email.'],
    },
    resetPass: {
      endpoint: 'reset-pass',
      method: 'put',
      redirect: {
        success: '/',
        failure: null,
      },
      resetPasswordTokenKey: 'reset_password_token',
      defaultErrors: ['Something went wrong, please try again.'],
      defaultMessages: ['Your password has been successfully changed.'],
    },
    refreshToken: {
      endpoint: 'refresh-token',
      method: 'post',
      redirect: {
        success: null,
        failure: null,
      },
      defaultErrors: ['Something went wrong, please try again.'],
      defaultMessages: ['Your token has been successfully refreshed.'],
    },
    token: {
      key: 'data.token',
      getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
        this.getConfigValue('token.key')),
    },
    errors: {
      key: 'data.errors',
      getter: (module: string, res: HttpErrorResponse) => getDeepFromObject(res.error,
        this.getConfigValue('errors.key'),
        this.getConfigValue(`${module}.defaultErrors`)),
    },
    messages: {
      key: 'data.messages',
      getter: (module: string, res: HttpResponse<Object>) => getDeepFromObject(res.body,
        this.getConfigValue('messages.key'),
        this.getConfigValue(`${module}.defaultMessages`)),
    },
  };

  constructor(protected http: HttpClient, private route: ActivatedRoute) {
    super();
  }

  authenticate(data?: any): Observable<NbAuthResult> {
    const method = this.getConfigValue('login.method');
    const url = this.getActionEndpoint('login');
    return this.http.request(method, url, {body: data, observe: 'response'})
      .pipe(
        map((res) => {
          if (this.getConfigValue('login.alwaysFail')) {
            throw this.createFailResponse(data);
          }

          return res;
        }),
        this.validateToken('login'),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('login.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('login', res),
            this.getConfigValue('token.getter')('login', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('login', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('login.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  register(data?: any): Observable<NbAuthResult> {
    const method = this.getConfigValue('register.method');
    const url = this.getActionEndpoint('register');
    return this.http.request(method, url, {body: data, observe: 'response'})
      .pipe(
        map((res) => {
          if (this.getConfigValue('register.alwaysFail')) {
            throw this.createFailResponse(data);
          }

          return res;
        }),
        this.validateToken('register'),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('register.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('register', res),
            this.getConfigValue('token.getter')('register', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('register', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('register.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  requestPassword(data?: any): Observable<NbAuthResult> {
    const method = this.getConfigValue('requestPass.method');
    const url = this.getActionEndpoint('requestPass');
    return this.http.request(method, url, {body: data, observe: 'response'})
      .pipe(
        map((res) => {
          if (this.getConfigValue('requestPass.alwaysFail')) {
            throw this.createFailResponse();
          }

          return res;
        }),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('requestPass.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('requestPass', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('requestPass', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('requestPass.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  resetPassword(data: any = {}): Observable<NbAuthResult> {
    const tokenKey = this.getConfigValue('resetPass.resetPasswordTokenKey');
    data[tokenKey] = this.route.snapshot.queryParams[tokenKey];

    const method = this.getConfigValue('resetPass.method');
    const url = this.getActionEndpoint('resetPass');
    return this.http.request(method, url, {body: data, observe: 'response'})
      .pipe(
        map((res) => {
          if (this.getConfigValue('resetPass.alwaysFail')) {
            throw this.createFailResponse();
          }

          return res;
        }),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('resetPass.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('resetPass', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('resetPass', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('resetPass.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  logout(): Observable<NbAuthResult> {

    const method = this.getConfigValue('logout.method');
    const url = this.getActionEndpoint('logout');

    return observableOf({})
      .pipe(
        switchMap((res: any) => {
          if (!url) {
            return observableOf(res);
          }
          return this.http.request(method, url, {observe: 'response'});
        }),
        map((res) => {
          if (this.getConfigValue('logout.alwaysFail')) {
            throw this.createFailResponse();
          }

          return res;
        }),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('logout.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('logout', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('logout', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('logout.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  refreshToken(data?: any): Observable<NbAuthResult> {
    const method = this.getConfigValue('refreshToken.method');
    const url = this.getActionEndpoint('refreshToken');

    return this.http.request(method, url, {body: data, observe: 'response'})
      .pipe(
        map((res) => {
          if (this.getConfigValue('refreshToken.alwaysFail')) {
            throw this.createFailResponse(data);
          }

          return res;
        }),
        this.validateToken('refreshToken'),
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getConfigValue('refreshToken.redirect.success'),
            [],
            this.getConfigValue('messages.getter')('refreshToken', res),
            this.getConfigValue('token.getter')('refreshToken', res));
        }),
        catchError((res) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = this.getConfigValue('errors.getter')('refreshToken', res);
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new NbAuthResult(
              false,
              res,
              this.getConfigValue('refreshToken.redirect.failure'),
              errors,
            ));
        }),
      );
  }

  protected validateToken (module: string): any {
    return map((res) => {
      const token = this.getConfigValue('token.getter')(module, res);
      if (!token) {
        const key = this.getConfigValue('token.key');
        console.warn(`NbEmailPassAuthProvider:
                          Token is not provided under '${key}' key
                          with getter '${this.getConfigValue('token.getter')}', check your auth configuration.`);

        throw new Error('Could not extract token from the response.');
      }
      return res;
    });
  }

  protected getActionEndpoint(action: string): string {
    const actionEndpoint: string = this.getConfigValue(`${action}.endpoint`);
    const baseEndpoint: string = this.getConfigValue('baseEndpoint');
    return baseEndpoint + actionEndpoint;
  }
}
