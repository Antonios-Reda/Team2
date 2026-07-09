import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SocketService } from '../../services/socket.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: Array<'patient' | 'doctor' | 'admin'>;
}

@Component({
  selector: 'bc-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly socket = inject(SocketService);

  readonly user = this.auth.user;
  readonly themeMode = this.theme.mode;
  readonly sidebarOpen = computed(() => true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/patient', icon: '📊', roles: ['patient'] },
    { label: 'Appointments', path: '/appointments', icon: '📅', roles: ['patient', 'doctor', 'admin'] },
    { label: 'Medical Files', path: '/medical-files', icon: '📁', roles: ['patient'] },
    { label: 'AI Reports', path: '/ai', icon: '🧠', roles: ['patient', 'doctor'] },
    { label: 'Payments', path: '/payments', icon: '💳', roles: ['patient', 'doctor', 'admin'] },
    { label: 'Notifications', path: '/notifications', icon: '🔔', roles: ['patient', 'doctor', 'admin'] },
    { label: 'Video Call', path: '/video-consultation', icon: '📹', roles: ['patient', 'doctor'] },
    { label: 'Dashboard', path: '/doctor', icon: '📊', roles: ['doctor'] },
    { label: 'Profile', path: '/doctor/profile', icon: '👨‍⚕️', roles: ['doctor'] },
    { label: 'Availability', path: '/doctor/availability', icon: '🕐', roles: ['doctor'] },
    { label: 'Admin', path: '/admin', icon: '⚙️', roles: ['admin'] },
  ];

  readonly visibleNav = computed(() => {
    const role = this.auth.role();
    return this.navItems.filter((item) => role && item.roles.includes(role));
  });

  constructor() {
    this.socket.connect();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.socket.disconnect();
    this.auth.logout();
  }
}
