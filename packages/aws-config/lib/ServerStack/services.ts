import * as ec2 from 'aws-cdk-lib/aws-ec2';

export default (shutdownTimer: number = 0) => new ec2.InitConfig([
  // server service
  ec2.InitFile.fromString('/etc/systemd/system/gamernetes.service', [
    '[Unit]',
    'Description=Gamernetes content server',
    'Wants=network.target gStatus.service gWatchdog.timer',
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

  // status file service
  ec2.InitFile.fromString('/etc/systemd/system/gStatus.service', [
    '[Unit]',
    'Description=Gamernetes status file toucher',
    '',
    '[Service]',
    'Type=oneshot',
    'ExecStart=/bin/bash -c ' +
      '"touch /var/g.coldstart && chmod 777 /var/g.coldstart"',
  ].join('\n')),

  // watchdog script
  ec2.InitFile.fromString('/usr/local/lib/gamernetes/watchdog.sh', [
    '#!/bin/bash',
    '',
    'if ! [ -x /srv/status.sh ]; then',
    '  echo "Status script does not exist" 1>&2',
    'elif /srv/status.sh | grep -q "idle"; then',
    '  echo "Server is idle; shutting down"',
    '  systemctl stop gamernetes',
    `  shutdown -h +${shutdownTimer}`,
    'else',
    '  echo "Server is active"',
    'fi',
  ].join('\n')),

  // watchdog unit
  ec2.InitFile.fromString('/etc/systemd/system/gWatchdog.service', [
    '[Unit]',
    'Description=Gamernetes watchdog',
    '',
    '[Service]',
    'Type=oneshot',
    'ExecStart=/usr/local/lib/gamernetes/watchdog.sh',
  ].join('\n')),

  // watchdog timer
  ec2.InitFile.fromString('/etc/systemd/system/gWatchdog.timer', [
    '[Unit]',
    'Description=Gamernetes watchdog',
    '',
    '[Timer]',
    'Unit=gWatchdog.service',
    'OnUnitActiveSec=15min',
  ].join('\n')),

  // start services
  ec2.InitService.enable('gamernetes'),
]);

