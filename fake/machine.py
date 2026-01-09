from random import random

class Pin:
	IN = 1
	OUT = 2

	def __init__(self, *_args):
		pass

	def value(self, *_args):
		return False

	def toggle(self):
		pass


class ADC:
    def __init__(self, pin):
        print(f'Set {pin} to ADC mode')
    
    def read_u16(self):
        return int(random() * (2**16 - 1))



class RTC:
	def __init__(self, *_args):
		pass

	def datetime(self, *_args):
		pass
