import { UserManager, WebStorageStateStore, User } from 'oidc-client'

export default class AuthService {
  private userManager: UserManager

  constructor() {
    // Note: Adapt these values to your setup.
    const STS_DOMAIN = 'http://localhost:8080'
    const CLIENT_ID = '230387246979678591@fim'

    const settings = {
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      authority: STS_DOMAIN,
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:5173/callback.html',
      automaticSilentRenew: true,
      silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
      response_type: 'code',
      scope: 'openid profile dataEventRecords',
      post_logout_redirect_uri: 'http://localhost:5173/',
      filterProtocolClaims: true
    }

    this.userManager = new UserManager(settings)
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser()
  }

  public login(): Promise<void> {
    return this.userManager.signinRedirect()
  }

  public logout(): Promise<void> {
    return this.userManager.signoutRedirect()
  }

  public getAccessToken(): Promise<string> {
    return this.userManager.getUser().then((data: any) => {
      return data.access_token
    })
  }
}
