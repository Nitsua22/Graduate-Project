# install this library with pip install lxml on windows
from lxml import etree # xml parsing lib

import sys # command line args lib

# create a parser that can resolve external entities
parser = etree.XMLParser(load_dtd=True,no_network=False,resolve_entities=True)

# parse the xml file passed in (argv1 is a filename)
tree = etree.parse(sys.argv[1], parser=parser)
#tree = etree.parse("orders_xxe.xml", parser=parser)

# collect the data and send it to stdout
data = etree.dump(tree.getroot())
