<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) RAW ���� DNG �t�@�C���ւ̕ϊ�

����͏��p�T�|�[�g�̂Ȃ��t���[ �\�t�g�E�F�A ([0-clause BSD-License](LICENSE.txt)) �ł��B

�����ł�: [�C���X�g�[��](#�C���X�g�[��) - [���ۉ�](#���ۉ�) - �������邱�Ƃ��ł��܂��B
[�g�p�@](#�g�p�@) - [ImBack �ł̉{��](#ImBack-�ł̉{��) - [node.js ���g�p�����R�}���h���C���o�R](#node.js-���g�p�����R�}���h���C���o�R) - [�ǂ̂悤�ɓ��삷�邩�H](#�ǂ̂悤�ɓ��삷�邩)

�ȈՃh�L�������g: [������](https://shyrodgau.github.io/imbraw2dng/README_ja)

�܂��� [�p���](https://shyrodgau.github.io/imbraw2dng/README)


## �C���X�g�[��

���݂̃o�[�W������ [V3.5.2_a8c2532 - �v���r���[ �C���[�W����](https://github.com/shyrodgau/imbraw2dng/releases/tag/V3.5.2_a8c2532). 
��: �G���[�����������ꍇ�A�V�����|�󂪒񋟂��ꂽ�ꍇ�A�܂��͐V�����摜�`�����ǉ����ꂽ�ꍇ�́A����ɊJ����i�߂܂��B

�t�@�C�� [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) f�� PC �ɃR�s�[���邩�A 
"Source code".zip �܂��� .tar.gz �o�[�W��������𓀂��āA���C�ɓ���̃u���E�U�ŊJ���܂� (��r�I�ŐV�̂��̂ł���Ή��ł��@�\���܂�)�B

���[�J���ɃC���X�g�[���ł��Ȃ��ꍇ�́A [���� github �y�[�W](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) 
(��ɍŐV�o�[�W�����ł���K�v������܂�) �܂��� [���Ȃ��� ImB ����](#ImBack-�ł̉{��) �܂��� [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
�Ȃǂ̃l�b�g���[�N����擾�ł��܂�(���̌���Ɏ����|�󂳂�܂����A��ɍŐV�Ƃ͌���܂���)�B �摜�f�[�^�̓u���E�U���Ɋm���Ɏc��܂��B


[node.js](#command-line-using-nodejs) �̏ꍇ�́AJavaScript �t�@�C�� [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) �݂̂��K�v�ł��B

github ���|�W�g���� [����](https://github.com/shyrodgau/imbraw2dng) �ɂ���܂��B

## ���ۉ�

���݃T�|�[�g����Ă��錾��́A�p�� (EN)�A�t�����X�� (FR)�A�h�C�c�� (DE)�A���{�� (JA) �ł��B HTML �t�@�C���̖��O�� `imbraw2dng_XX.html` (`XX` 
�͌���V���[�g�J�b�g) �ɕύX���ĕۑ�����ƁA���̌���Ńy�[�W�����ڊJ���܂��B �|��ɍv���������ꍇ�́A���ǂ�ł�����e��|�󂷂邩�A
[����](https://shyrodgau.github.io/imbraw2dng/translations.xls) �����ĘA�����Ă��������B!

[node.js](https://nodejs.org) �o�[�W���� &ge; V20.10(LTS) �̏ꍇ�A�t�@�C�� [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) ���擾���A
`imbraw2dng_00.js` �̉��ɕۑ����Ă���A `node imbraw2dng_00.js -CSV > mytexts.csv` ���Ăяo���āA�e�L�X�g���܂ތ��݂̖|�󂳂ꂽ CSV �𐶐��ł��܂��B


## �g�p�@

I'm back ����i�܂�APC �ɑ}�����ꂽ�}�C�N�� SD ����j���ׂẴt�@�C������t�B�[���h�Ƀh���b�O �A���h �h���b�v�ł��܂��B ���ɁA���ׂĂ̔� RAW �t�@�C���𐳊m�ɃR�s�[���ARAW �t�@�C���� DNG �ɕϊ����A`.raw`/`.RAW` �t�@�C���g���q�� `.dng` �ɒu�������܂��B `�t�@�C����I��` �{�^�����g�p����ƁARAW �t�@�C���𒼐ڑI���ł��܂��B

�u���E�U�̓_�E�����[�h�ݒ�ɏ]���ăt�@�C�����_�E�����[�h���邽�߁A���̂悤�ɐݒ肳��Ă���ꍇ�̓t�@�C�����Ƃɕۑ����邽�߂̃_�C�A���O���|�b�v�A�b�v�\������邩�A���̂悤�ɐݒ肳��Ă���ꍇ�͂��ׂẴt�@�C�����_�E�����[�h �f�B���N�g���ɃX���[���� (�����炭���O��ύX����) ���A�܂��́A �܂���...

���݁ADNG �ւ̕ϊ��ł́A�t�@�C�������K�؂� I'm Back �t�@�C���� (���Ȃ킿�A`YYYY_MMDD_hhmmss`) �ł���Ǝv����ꍇ�̓^�C���X�^���v �^�O���ݒ肳��AOriginalRawFilename �� RAW ���̓t�@�C���̖��O�ɐݒ肳��܂��B �������邱�ƂŁA���̏����قƂ�ǎ������ƂȂ��ADNG �t�@�C���ɍD���Ȗ��O��t���邱�Ƃ��ł��܂��B

�V�@�\: RAW �t�@�C���̃v���r���[���g�p���āA�i�K�I�Ɏ��s�ł��܂��B ���̂��߂ɂ́A`�v���r���[����ŃV���O���X�e�b�v` �`�F�b�N�{�b�N�X���I���ɂ��܂��B �e�t�@�C���ŁA���̃t�@�C�����������邩�X�L�b�v���邩��I���ł��܂��B�܂��A���ݑI�����Ă���c��̃t�@�C���ɓ����A�N�V������K�p���邩�ǂ������I���ł��܂��B

## ImBack �ł̉{��

HTML �t�@�C�� ( [���ۉ�](#���ۉ�) �ɉ����Ė��O���ύX) �� ImBack ���̃}�C�N�� SD�A���Ƃ��� `IMBACK` �t�H���_�[�ɒu�����Ƃ��ł��܂��B ���ɁAPC �� ImBack Wifi �ɐڑ����A[���Ȃ��� Imback](http://192.168.1.254/IMBACK/imbraw2dng.html) (�܂��͖��O��ύX��������) ���Q�Ƃ��܂��B

�w�肳�ꂽ�^�C���X�^���v���V�����t�@�C���𒼐ڏ���/�R�s�[������A�r�W���A�� �u���E�U���g�p���� ImBack ��̃t�@�C������ނ���t���ƂɊm�F������ł��܂��B RAW�摜��JPEG�摜���\������܂��B �ϊ�/�_�E�����[�h�܂��͍폜����t�@�C����I���ł��܂��B

## node.js ���g�p�����R�}���h���C���o�R

[node.js](https://nodejs.org) �o�[�W���� &ge; V20.10(LTS) ���C���X�g�[������Ă���ꍇ�́A�t�@�C�� 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) ���擾���邱�ƂŁA�R�}���h ���C���o�R�ŕϊ����s�����Ƃ��ł��܂��B[���ۉ�](#internationalization) �ɏ]���������K�����K�p����܂��B
�p�����[�^�ƌĂяo���w���v�́A�m�[�h `node imbraw2dng.js` �œǂݎ�邱�Ƃ��ł��܂��B
```
�g�p�@: node imbraw2dng.js [-l lang] [-f] [-d dir] [-nc | -co] { [-R] [-J] [-O] [-n yyyy_mmdd_hhmmss] | [--] <files-or-dirs> }
�I�v�V����:
 -h - ���̃w���v��\�����܂�
 -nc - �F�t���̃e�L�X�g���g�p���܂���
 -co - �F�t���̃e�L�X�g���������܂�
 -l XX - �͗L���Ȍ���R�[�h�ł� (����: DE�AEN�AFR�AJA)
         �t�@�C������ imbraw2dng_XX.js �ɕύX���邱�ƂŌ����ݒ肷�邱�Ƃ��ł��܂��B
 -d dir - �o�̓t�@�C���� dir �ɒu���܂�
 -f - �����̃t�@�C�����㏑�����܂�
 -R - Wifi �o�R�Őڑ����ꂽ ImB ���� RAW ���擾���܂�
 -J - Wifi �o�R�Őڑ�����Ă��� ImB ���� JPEG ���擾���܂�
 -O - Wifi �o�R�Őڑ����ꂽ ImB ����� RAW/�� JPEG ���擾���܂�
 -n yyyy_mmdd_hhmmss (�܂��͔C�ӂ̒����̃v���t�B�b�N�X) - ImB ���炱�̃^�C���X�^���v���V�������݂̂̂�I�����܂�
 -----
 -- - �c��̃p�����[�^�����[�J�� �t�@�C���܂��̓f�B���N�g���Ƃ��Ĉ����܂�
 <files-or-dirs> �� -R/-J/-O/-n �͓����Ɏg�p�ł��܂���B
```

## �ǂ̂悤�ɓ��삷�邩

DNG �� TIFF �Ɏ����`���ŁA��Ɍ��̉摜�̃X�L�������C���̎��͂̒萔�f�[�^�ō\������܂��B �f�[�^�́A�摜�̕��A���� 
(�����͖����I�Ɏ�����Ă���A�f�[�^���ɉ����đ����̃I�t�Z�b�g������܂�)�A����уt�@�C���� (OriginalRawFilename �^�O�̏ꍇ) �ɂ���ĈقȂ�܂��B ImB 
�t�@�C�����̓��t���L���ł���Ǝv����ꍇ�́A���̓��t�Ƀ^�O (EXIFTAG_DATETIMEORIGINAL�ATIFFTAG_DATETIME) ���ǉ�����܂��B MF ImB ����̂��̂ł���ꍇ�A�J���[ �t�B���^�[ �A���C�͈قȂ�܂��B

�F�ɂ��ẮA[DNG�̏���](README_ja#DNG-�̏���)�����ǂ݂��������B