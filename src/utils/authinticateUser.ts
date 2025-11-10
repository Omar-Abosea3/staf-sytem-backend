import { authenticate, AuthenticationOptions } from 'ldap-authentication';

async function authenticateUser(username: string, password: string) {
  const updatedUserName = `${username}@Norpetco.org`
  // اختر إما البريد الكامل أو اسم المستخدم القصير
  const usernameAttr = username.includes("@") ? "userPrincipalName" : "sAMAccountName";

  const options: AuthenticationOptions = {
    ldapOpts: {
      url: process.env.DOMAIN_ACTIVE_DIRECTORY || "ldap://10.10.10.20",
    },
    adminDn: process.env.ADMIN_DN,
    adminPassword: process.env.ADMIN_PASSWORD,
    userSearchBase: process.env.USER_SEARCH_BASE || "DC=norpetco,DC=org", // البحث في كامل الدومين
    usernameAttribute: usernameAttr,
    username: username,
    userPassword: password,
    attributes: ["dn", "cn", "memberOf"],
  };

  try {
    const user = await authenticate(options);
    if (!user) return { user: null };

    // معالجة المجموعات
    let groups: string[] = [];
    if (user.memberOf) {
      const memberOf = Array.isArray(user.memberOf) ? user.memberOf : [user.memberOf];
      groups = memberOf.map((dn: string) => {
        const match = dn.match(/CN=([^,]+)/);
        return match ? match[1] : dn;
      });
    }

    return { user, groups };
  } catch (error) {
    console.error("Authentication failed:", error);
    return { user: null };
  }
}

export default authenticateUser;
