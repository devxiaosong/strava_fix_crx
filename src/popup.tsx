import { useEffect, useState } from 'react';
import { Button, Card, Radio, Space, Typography, Divider, App } from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  SnippetsOutlined,
  MailOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import type { IntervalSpeed } from '~/types/settings';
import { INTERVAL_CONFIG } from '~/types/settings';
import { getSettings, saveSettings } from '~/utils/storage';
import './style.css';

const { Title, Text, Link } = Typography;

function IndexPopup() {
  const { message } = App.useApp();
  const [appName, setAppName] = useState<string>('');
  const [intervalSpeed, setIntervalSpeed] = useState<IntervalSpeed>('default');

  // 读取manifest中的应用名称
  useEffect(() => {
    const manifest = chrome.runtime.getManifest();
    setAppName(manifest.name || 'Pro Bulk Edit for Strava');
  }, []);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setIntervalSpeed(settings.intervalSpeed);
  };

  const handleIntervalChange = async (value: IntervalSpeed) => {
    setIntervalSpeed(value);

    const success = await saveSettings({ intervalSpeed: value });

    if (success) {
      message.success(`Set to ${value} mode`);
    } else {
      message.error('Failed to save settings, please try again');
    }
  };

  const handleGoToStrava = () => {
    chrome.tabs.create({
      url: 'https://www.strava.com/athlete/training',
    });
  };

  return (
    <App>
      <div className="popup-container">
        {/* Header */}
        <div className="popup-header">
          <RocketOutlined style={{ fontSize: 20, marginRight: 8 }} />
          <Title level={4} style={{ margin: 0 }}>
            {appName}
          </Title>
        </div>

        {/* Body */}
        <div className="popup-body">
          {/* Automation Pace Settings */}
          <Card
            size="small"
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Automation Pace</span>
              </Space>
            }
            style={{ marginBottom: 12 }}
          >
            <Radio.Group
              value={intervalSpeed}
              onChange={(e) => handleIntervalChange(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="quick">
                  <Space>
                    <ThunderboltOutlined />
                    <Text strong>Quick</Text>
                  </Space>
                </Radio>
                <Radio value="default">
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Default</Text>
                  </Space>
                </Radio>
                <Radio value="slow">
                  <Space>
                    <SnippetsOutlined />
                    <Text strong>Slow</Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              How fast the extension performs actions (slower is more stable)
            </Text>
          </Card>

          {/* Strava Entry */}
          <Card size="small" title="Quick Navigation">
            <Button
              type="primary"
              icon={<RocketOutlined />}
              block
              size="large"
              onClick={handleGoToStrava}
            >
              Go to Strava Activities
            </Button>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              Click to go to training log page and start bulk editing
            </Text>
          </Card>
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <MailOutlined style={{ marginRight: 6 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Support Email:{' '}
            <Link href="mailto:extensionkit@gmail.com" target="_blank">
              extensionkit@gmail.com
            </Link>
          </Text>
        </div>
      </div>
    </App>
  );
}

export default IndexPopup;
