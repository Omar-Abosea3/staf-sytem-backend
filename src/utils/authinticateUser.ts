
import { authenticate, AuthenticationOptions } from 'ldap-authentication';

async function authenticateUser(username: string, password: string) {
  const options: AuthenticationOptions = {
    ldapOpts: {
      url: process.env.DOMAIN_ACTIVE_DIRECTORY || "ldap://10.10.10.20" , // IP of your Domain Controller
    },
    adminDn: process.env.ADMIN_DN,
    adminPassword:  process.env.ADMIN_PASSWORD,
    userSearchBase: process.env.USER_SEARCH_BASE,
    usernameAttribute: 'sAMAccountName',
    username: username,
    userPassword: password,
    attributes: ['dn', 'cn', 'memberOf']
  };

  try {
    const user = await authenticate(options);
    if(!user) return {user:null};
    if (user && user.memberOf) {
      // Extract group names from DN format
      const groups = Array.isArray(user.memberOf) 
        ? user.memberOf.map((dn: string) => {
            const match = dn.match(/CN=([^,]+)/);
            return match ? match[1] : dn;
          })
        : [user.memberOf].map((dn: string) => {
            const match = dn.match(/CN=([^,]+)/);
            return match ? match[1] : dn;
          });
      
      return { user, groups };
    }
    return {user};
  } catch (error) {
    console.error('Authentication failed:', error);
    return {user:null};
  }
}

export default authenticateUser;
