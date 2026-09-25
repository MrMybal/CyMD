import io
import sys
import unittest
from pathlib import Path

root = Path(sys.argv.pop(1)).resolve()
sys.path[:0] = [str(root), str(root / 'tests')]
import test_core
from cyai.media import upload


class CyMDIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.fixture = test_core.CoreTests()
        self.fixture.setUp()

    def tearDown(self):
        self.fixture.tearDown()

    def test_open_is_scoped_to_conversation_and_enabled_plugin(self):
        f = self.fixture
        result = upload(f.service, f.conversation, 'example.md', io.BytesIO(b'# Example'), 9)
        opened = f.service.action('cymd_open', {'conversation_id': f.conversation, 'id': result['id']})
        self.assertEqual(opened, {'name': 'example.md', 'url': '/media/' + result['id']})
        other = f.action_conversation('chat')
        with self.assertRaises(ValueError):
            f.service.action('cymd_open', {'conversation_id': other, 'id': result['id']})
        f.service.plugins.config['plugins']['cymd']['enabled'] = False
        with self.assertRaises(ValueError):
            f.service.action('cymd_open', {'conversation_id': f.conversation, 'id': result['id']})

    def test_new_document_and_invalid_extension(self):
        f = self.fixture
        self.assertEqual(f.service.action('cymd_open', {'conversation_id': f.conversation})['name'], 'Sans titre.md')
        result = upload(f.service, f.conversation, 'example.html', io.BytesIO(b'html'), 4)
        with self.assertRaises(ValueError):
            f.service.action('cymd_open', {'conversation_id': f.conversation, 'id': result['id']})


if __name__ == '__main__':
    unittest.main()
