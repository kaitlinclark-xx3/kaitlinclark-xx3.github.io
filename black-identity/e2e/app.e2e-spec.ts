import { BlackIdentityPage } from './app.po';

describe('black-identity App', function() {
  let page: BlackIdentityPage;

  beforeEach(() => {
    page = new BlackIdentityPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
