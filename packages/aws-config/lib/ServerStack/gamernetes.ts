import * as ec2 from 'aws-cdk-lib/aws-ec2';

export default (shutdownTimer: number = 0) => new ec2.InitConfig([
  // server service
  ec2.InitFile.fromString('/etc/systemd/system/gamernetes.service', [
    '[Unit]',
    'Description=Gamernetes content server',
    'Wants=network.target',
    'After=network.target',
    '',
    '[Service]',
    'Type=simple',
    'User=gamernetes',
    'Group=gamernetes',
    'WorkingDirectory=/srv',
    'ExecStart=/srv/run.sh',
    'ExecStop=/srv/shutdown.sh',
    'Restart=on-failure',
    '',
    '[Install]',
    'WantedBy=multi-user.target',
  ].join('\n')),

  // watchdog script
  ec2.InitFile.fromString('/usr/local/lib/gamernetes/watchdog.sh', [
    '#!/bin/bash',
    '',
    'if /srv/status.sh | grep -q "idle"; then ' +
      'systemctl stop gamernetes; ' +
      `shutdown -h +${shutdownTimer}; ` +
    'fi',
  ].join('\n')),

  // watchdog unit
  ec2.InitFile.fromString('/etc/systemd/system/gWatchdog.service', [
    '[Unit]',
    'Description=Gamernetes watchdog',
    'Wants=gamernetes.service',
    '',
    '[Service]',
    'Type=simple',
    'User=gamernetes',
    'Group=gamernetes',
    'WorkingDirectory=/srv',
    'ExecStart=/srv/run.sh',
    'ExecStop=/srv/shutdown.sh',
    'Restart=on-failure',
    '',
    '[Install]',
    'WantedBy=gamernetes.service',
  ].join('\n'),

  // watchdog timer
  ec2.InitFile.fromString('/etc/systemd/system/gWatchdog.timer', [
    '# Gamernetes server watchdog',
    '# Checks for activity in server every 15m',
    '0,15,30,45 * * * *  ' +
      'if /srv/status.sh | grep -q "idle"; then ' +
        'systemctl stop gamernetes; ' +
        `shutdown -h +${shutdownTimer}; ` +
      'fi',
    '',
    '# Existence of /var/g.coldstart indicates that server just started',
    '# Intended to be deleted at first status check',
    '@reboot touch /var/g.coldstart && chmod 777 /var/g.coldstart',
  ].join('\n')),

  // status file unit
  ec2.InitFile.fromString('/etc/systemd/system/gStatus.timer', [
    '[Unit]',
    'Description=Gamernetes status file toucher',
    '',
    '[Timer]',
    'OnBootSec=0',
    '',
    '[Install]',
    'WantedBy=timers.target',
  ].join('\n')),

  // start server
  ec2.InitService.enable('crond'),
  ec2.InitService.enable('gamernetes'),
]);

