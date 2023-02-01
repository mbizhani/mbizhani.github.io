---
layout: page
title: Cryptography
---

## OpenSSL

- Create a Root-CA & Intermediate Chain

```shell
################################
## Generate Root & Intermediate
################################
echo "--- Generate Root & Intermediate ---"
for C in root-ca intermediate;
do
  mkdir -p $C/{certs,crl,newcerts,private}

  echo 1000 > $C/serial
  touch $C/index.txt
  # https://serverfault.com/questions/857131/odd-error-while-using-openssl
  echo "unique_subject = yes/no" > $C/index.txt.attr

  cat > $C/openssl.conf << EOF
[ ca ]
default_ca = CA_default
[ CA_default ]
dir            = $C
certs          = \$dir/certs               # Where the issued certs are kept
crl_dir        = \$dir/crl                 # Where the issued crl are kept
database       = \$dir/index.txt           # database index file.
new_certs_dir  = \$dir/newcerts            # default place for new certs.
certificate    = \$dir/cacert.pem          # The CA certificate
serial         = \$dir/serial              # The current serial number
crl            = \$dir/crl.pem             # The current CRL
private_key    = \$dir/private/ca.key.pem  # The private key
RANDFILE       = \$dir/.rnd                # private random number file
nameopt        = default_ca
certopt        = default_ca
policy         = policy_match
default_days   = 365
default_md     = sha256
default_bits   = 2048

[ policy_match ]
countryName            = optional
stateOrProvinceName    = optional
organizationName       = optional
organizationalUnitName = optional
commonName             = supplied
emailAddress           = optional

[req]
req_extensions     = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]

[v3_req]
basicConstraints = CA:TRUE
EOF
done

echo "* S1"
openssl genrsa -out root-ca/private/ca.key
echo "* S2"
openssl req -new -x509 -days 3650 -subj '/CN=Root-ca' \
  -config root-ca/openssl.conf \
  -sha256 -extensions v3_req \
  -key root-ca/private/ca.key \
  -out root-ca/certs/ca.crt

echo "* S3"
openssl genrsa -out intermediate/private/intermediate.key
echo "* S4"
openssl req -sha256 -new -subj '/CN=Intermediate' \
  -config intermediate/openssl.conf \
  -key intermediate/private/intermediate.key \
  -out intermediate/certs/intermediate.csr
echo "* S5"
openssl ca -batch -extensions v3_req -notext -days 3650 \
  -config intermediate/openssl.conf \
  -keyfile root-ca/private/ca.key \
  -cert root-ca/certs/ca.crt \
  -in intermediate/certs/intermediate.csr \
  -out intermediate/certs/intermediate.crt


##############################
## Verify Root & Intermediate
##############################
echo "--- Verify Root & Intermediate ---"
openssl verify -CAfile root-ca/certs/ca.crt root-ca/certs/ca.crt
openssl verify -CAfile root-ca/certs/ca.crt intermediate/certs/intermediate.crt


###################
## Generate Client
###################
echo "--- Generate Client ---"
CLIENT_DIR="client"
CLIENT_NAME="client"
mkdir ${CLIENT_DIR}
echo "* S6"
openssl req -new -nodes -newkey rsa:2048 -subj "/CN=${CLIENT_NAME}.example.com" \
  -out ${CLIENT_DIR}/${CLIENT_NAME}.csr \
  -keyout ${CLIENT_DIR}/${CLIENT_NAME}.key
echo "* S7"
openssl ca -batch -notext -days 730 \
  -config root-ca/openssl.conf -md sha256 \
  -keyfile intermediate/private/intermediate.key \
  -cert intermediate/certs/intermediate.crt \
  -out ${CLIENT_DIR}/${CLIENT_NAME}.crt \
  -infiles ${CLIENT_DIR}/${CLIENT_NAME}.csr


#################
## Verify Client
#################
echo "--- Verify Client ---"
#openssl x509 -in ${CLIENT_DIR}/${CLIENT_NAME}.crt -text -noout
cat intermediate/certs/intermediate.crt root-ca/certs/ca.crt > ${CLIENT_DIR}/trust-chain.crt
openssl verify -CAfile ${CLIENT_DIR}/trust-chain.crt ${CLIENT_DIR}/${CLIENT_NAME}.crt
```
