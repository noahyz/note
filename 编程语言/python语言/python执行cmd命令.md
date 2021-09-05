# python执行cmd命令

https://www.cnblogs.com/yoyoketang/p/9083932.html

os.system()

os.popen()

https%3A%2F%2Fwww.cnblogs.com%2Fyoyoketang%2Fp%2F9083932.html%0A%0Aret%20%3D%20os.system(%22ls%22)%0A%E8%BF%94%E5%9B%9E%E7%9A%84ret%E6%98%AF%E6%AD%A3%E7%A1%AE%E7%A0%81%E6%88%96%E8%80%85%E9%94%99%E8%AF%AF%E7%A0%81%EF%BC%8C%E4%B8%8D%E6%98%AF%E5%91%BD%E4%BB%A4%E8%BF%94%E5%9B%9E%E7%9A%84%E5%80%BC%0A%0A%0Aos.system()%0Aos.popen()%0A%0A%0Aimport%20os%20%0A%23%20popen%E8%BF%94%E5%9B%9E%E6%96%87%E4%BB%B6%E5%AF%B9%E8%B1%A1%EF%BC%8C%E8%B7%9Fopen%E6%93%8D%E4%BD%9C%E4%B8%80%E6%A0%B7%0Af%20%3D%20os.popen(r%22python%20d%3A%5Chello.py%22%2C%20%22r%22)%0Ad%20%3D%20f.read()%0A%23%20%E8%AF%BB%E6%96%87%E4%BB%B6%0Aprint(d)%0Aprint(type(d))%0Af.close()
