export class User {
  username = '';
  email = '';
  password = '';
  uId = '';
  sex?: 'male' | 'female' = 'male'
  icon = '';
  role: 'user' | 'supervisor' | 'admin' = 'user';
  jwt? = '';
}