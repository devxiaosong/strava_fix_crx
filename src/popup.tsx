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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setIntervalSpeed(value);

    const success = await saveSettings({ intervalSpeed: value });

    if (success) {
      message.success(`已设置为 ${value} 模式 (${INTERVAL_CONFIG[value]}ms)`);
    } else {
      message.error('设置保存失败，请重试');
    }

    setLoading(false);
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
          {/* 操作间隔设置 */}
          <Card
            size="small"
            title={
              <Space>
                <ClockCircleOutlined />
                <span>操作间隔</span>
              </Space>
            }
            style={{ marginBottom: 12 }}
          >
            <Radio.Group
              value={intervalSpeed}
              onChange={(e) => handleIntervalChange(e.target.value)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="quick">
                  <Space>
                    <ThunderboltOutlined />
                    <Text strong>Quick</Text>
                    <Text type="secondary">(1500ms)</Text>
                  </Space>
                </Radio>
                <Radio value="default">
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Default</Text>
                    <Text type="secondary">(3000ms)</Text>
                  </Space>
                </Radio>
                <Radio value="slow">
                  <Space>
                    <SnippetsOutlined />
                    <Text strong>Slow</Text>
                    <Text type="secondary">(4500ms)</Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              设置批量操作时每个活动之间的延迟时间
            </Text>
          </Card>

          {/* Strava入口 */}
          <Card size="small" title="快速导航">
            <Button
              type="primary"
              icon={<RocketOutlined />}
              block
              size="large"
              onClick={handleGoToStrava}
            >
              进入 Strava Activities
            </Button>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              点击前往训练日志页面开始批量编辑
            </Text>
          </Card>
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <MailOutlined style={{ marginRight: 6 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            支持邮箱:{' '}
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
