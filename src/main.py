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


def send_data(addr, raw, waterline, txt):
	resp = urequests.get(f'{addr}?type=pushData&raw={raw}&waterline={waterline}&txt={txt}').text
	print(resp)


def connect(wlan_credentials):
	wlan = network.WLAN(network.STA_IF)
	wlan.active(True)

	wlan.connect(*wlan_credentials.split('\n'))

	while not wlan.isconnected():
		print('.', end='')
		time.sleep(1)


ADC_PIN = 28 # ADC2

def main():
	addr = open('secrets/gs_url').read()
	wlan_credentials = open('secrets/wlan_credentials').read()
	connect(wlan_credentials)
	config = get_config(addr)
	

	adc = machine.ADC(ADC_PIN)
	send_data(addr, '', '', 'startup')

	while True:
		raw = adc.read_u16()
		waterline = int((raw + config['conversion']['offset']) * config['conversion']['linear'])
		send_data(addr, raw, waterline, '')

		time.sleep(config['measurement_delay'])

if __name__ == '__main__':
	main()
