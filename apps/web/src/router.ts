import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/policies' },
    { path: '/policies', name: 'policies', component: () => import('@/views/PoliciesView.vue') },
    { path: '/compose', name: 'compose', component: () => import('@/views/ComposeView.vue') },
    { path: '/audit', name: 'audit', component: () => import('@/views/AuditView.vue') },
  ],
});
