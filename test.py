import json

try:
    with open('/root/bin/file-manager/resources/files.json', 'r') as json_file:
        json_str = json_file.read()
        data = json.loads(json_str)
except Exception as e:
    print(f'{e}')

print(data['content'])
