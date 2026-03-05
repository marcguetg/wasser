try:
	import machine
	import urequests
	import network
except ImportError as err:
	print(f'Start fake mode, could not load {err}')
	import sys
	from pathlib import Path
	sys.path.append(str(Path(__file__).resolve().parents[1]))
	from fake import machine, network
	import requests as urequests


import json
import time


def get_config(addr):
	raw = urequests.get(f'{addr}?type=config').text
	print(raw)
	return json.loads(raw)


def send_data(addr, raw, waterline, txt, timeout):
	while True:
		try:
			resp = urequests.get(
				f'{addr}?type=pushData&raw={raw}&waterline={waterline}&txt={txt}',
				timeout=timeout
			).text
			break
		except OSError:
			print('timeout')


def connect(wlan_credentials):
	wlan = network.WLAN(network.STA_IF)
	wlan.active(True)

	wlan.connect(*wlan_credentials.split('\n'))

	while not wlan.isconnected():
		print('.', end='')
		time.sleep(1)


ADC_PIN = 28 # ADC2

def main():
	addr = open('gs_url').read()
	wlan_credentials = open('wlan').read()
	connect(wlan_credentials)
	config = get_config(addr)
	n_average = config['average']
	
	store = [i for i in range(n_average)]
	

	adc = machine.ADC(ADC_PIN)
	send_data(addr, '', '', 'startup', config['timeout'])

	while True:
		for i in range(n_average):
			store[i] = adc.read_u16()
			time.sleep(1)
        
		raw = sorted(store)[n_average // 2]
		waterline = int(raw * config['conversion']['linear'] + config['conversion']['offset'])
		send_data(addr, raw, waterline, '', config['timeout'])

if __name__ == '__main__':
	main()

